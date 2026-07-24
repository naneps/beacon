import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from backend.app.routers.environments import capture_environment_variable


class EnvironmentCaptureTests(unittest.TestCase):
    def make_store(self):
        project = {
            "id": "project-1",
            "current_environment_id": "env-1",
            "environments": [{
                "id": "env-1",
                "name": "Staging",
                "variables": {"refresh_token": "keep-me"},
            }],
        }
        fake = SimpleNamespace(
            projects=[project],
            current_project_id="project-1",
            sync_current_config_calls=0,
            save_calls=0,
        )
        fake.sync_current_config = lambda: setattr(fake, "sync_current_config_calls", fake.sync_current_config_calls + 1)
        fake.save = lambda: setattr(fake, "save_calls", fake.save_calls + 1)
        return fake, project

    def test_capture_updates_one_variable_without_replacing_others(self):
        fake, project = self.make_store()
        with patch("backend.app.routers.environments.store", fake):
            result = capture_environment_variable("project-1", "env-1", "access_token", {"value": "new-token"})

        self.assertEqual(result, {"status": "captured", "name": "access_token"})
        self.assertEqual(project["environments"][0]["variables"], {
            "refresh_token": "keep-me",
            "access_token": "new-token",
        })
        self.assertEqual(fake.sync_current_config_calls, 1)
        self.assertEqual(fake.save_calls, 1)

    def test_capture_requires_a_value(self):
        fake, _ = self.make_store()
        with patch("backend.app.routers.environments.store", fake):
            with self.assertRaises(HTTPException) as error:
                capture_environment_variable("project-1", "env-1", "token", {})
        self.assertEqual(error.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
