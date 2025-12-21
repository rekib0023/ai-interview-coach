"""Code execution service using Docker containers."""

import asyncio
import logging
import time
from typing import Optional

import docker
from docker.errors import ContainerError, DockerException

from .models import CodeLanguage

logger = logging.getLogger(__name__)


class CodeExecutionService:
    """Service for executing user code in Docker containers."""

    # Resource limits
    MEMORY_LIMIT = "512m"  # 512 MB
    CPU_QUOTA = 50000  # 50% of one CPU (in microseconds)
    TIMEOUT_SECONDS = 10  # Maximum execution time

    # Docker images for each language
    IMAGES = {
        CodeLanguage.PYTHON: "python:3.11-slim",
        CodeLanguage.JAVASCRIPT: "node:20-slim",
        CodeLanguage.TYPESCRIPT: "node:20-slim",  # TypeScript runs via ts-node
    }

    def __init__(self):
        """Initialize Docker client."""
        try:
            self.client = docker.from_env()
            # Test connection
            self.client.ping()
            logger.info("Docker client initialized successfully")
        except DockerException as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None

    async def execute_code(
        self,
        code: str,
        language: CodeLanguage,
        timeout: Optional[int] = None,
    ) -> dict:
        """
        Execute code in a Docker container.

        Args:
            code: The code to execute
            language: Programming language
            timeout: Optional timeout override (default: TIMEOUT_SECONDS)

        Returns:
            dict with keys: stdout, stderr, exit_code, execution_time_ms, memory_used_mb, timed_out
        """
        if not self.client:
            return {
                "stdout": "",
                "stderr": "Docker service unavailable",
                "exit_code": 1,
                "execution_time_ms": 0,
                "memory_used_mb": 0,
                "timed_out": False,
            }

        timeout = timeout or self.TIMEOUT_SECONDS
        start_time = time.time()

        try:
            # Prepare command based on language
            command = self._get_command(code, language)

            # Run in container with resource limits
            result = await asyncio.to_thread(
                self._run_container,
                command,
                language,
                timeout,
            )

            execution_time_ms = int((time.time() - start_time) * 1000)

            return {
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", ""),
                "exit_code": result.get("exit_code", 0),
                "execution_time_ms": execution_time_ms,
                "memory_used_mb": result.get("memory_used_mb", 0),
                "timed_out": result.get("timed_out", False),
            }

        except Exception as e:
            logger.error(f"Error executing code: {e}")
            execution_time_ms = int((time.time() - start_time) * 1000)
            return {
                "stdout": "",
                "stderr": f"Execution error: {str(e)}",
                "exit_code": 1,
                "execution_time_ms": execution_time_ms,
                "memory_used_mb": 0,
                "timed_out": False,
            }

    def _get_command(self, code: str, language: CodeLanguage) -> list[str]:
        """Get the command to execute based on language."""
        if language == CodeLanguage.PYTHON:
            return ["python", "-c", code]
        elif language == CodeLanguage.JAVASCRIPT:
            return ["node", "-e", code]
        elif language == CodeLanguage.TYPESCRIPT:
            # For TypeScript, we'd need ts-node, but for simplicity, treat as JS
            # In production, you'd compile TS first or use ts-node
            return ["node", "-e", code]
        else:
            raise ValueError(f"Unsupported language: {language}")

    def _run_container(
        self, command: list[str], language: CodeLanguage, timeout: int
    ) -> dict:
        """Run code in a Docker container synchronously."""
        image = self.IMAGES[language]
        container = None

        try:
            # Pull image if not exists
            try:
                self.client.images.get(image)
            except docker.errors.ImageNotFound:
                logger.info(f"Pulling image {image}")
                self.client.images.pull(image)

            # Create and run container in detached mode for better control
            container = self.client.containers.run(
                image,
                command=command,
                detach=True,
                mem_limit=self.MEMORY_LIMIT,
                cpu_quota=self.CPU_QUOTA,
                cpu_period=100000,  # 100ms period
                network_disabled=True,  # Disable network for security
                security_opt=["no-new-privileges"],
                cap_drop=["ALL"],  # Drop all capabilities
                user="nobody",  # Run as non-root user
                remove=False,  # We'll remove manually
            )

            # Wait for container to finish (with timeout)
            timed_out = False
            try:
                result = container.wait(timeout=timeout)
                exit_code = result.get("StatusCode", 0)
            except Exception:
                # Timeout or other error
                container.kill()
                exit_code = 124  # Standard timeout exit code
                timed_out = True

            # Get logs
            stdout = container.logs(stdout=True, stderr=False).decode(
                "utf-8", errors="replace"
            )
            stderr = container.logs(stdout=False, stderr=True).decode(
                "utf-8", errors="replace"
            )

            # Get memory stats if available
            try:
                stats = container.stats(stream=False)
                memory_used_mb = stats.get("memory_stats", {}).get("usage", 0) // (
                    1024 * 1024
                )
            except Exception:
                memory_used_mb = 0

            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": exit_code,
                "memory_used_mb": memory_used_mb,
                "timed_out": timed_out,
            }

        except ContainerError as e:
            # Container exited with non-zero code
            stderr = str(e.stderr) if hasattr(e, "stderr") else str(e)
            return {
                "stdout": "",
                "stderr": stderr,
                "exit_code": e.exit_status if hasattr(e, "exit_status") else 1,
                "memory_used_mb": 0,
                "timed_out": False,
            }

        except Exception as e:
            error_msg = str(e)
            timed_out = (
                "timeout" in error_msg.lower() or "timed out" in error_msg.lower()
            )

            return {
                "stdout": "",
                "stderr": error_msg,
                "exit_code": 1,
                "memory_used_mb": 0,
                "timed_out": timed_out,
            }

        finally:
            # Ensure container is removed
            if container:
                try:
                    container.remove(force=True)
                except Exception:
                    pass


# Singleton instance
code_execution_service = CodeExecutionService()
