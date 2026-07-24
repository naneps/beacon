import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from backend.app.routers.projects import reorder_projects


class ProjectReorderTests(unittest.TestCase):
    def make_store(self):
        fake = SimpleNamespace(
            projects=[
                {"id": "project-a", "name": "A"},
                {"id": "project-b", "name": "B"},
                {"id": "project-c", "name": "C"},
            ],
            save_calls=0,
        )
        fake.save = lambda: setattr(fake, "save_calls", fake.save_calls + 1)
        return fake

    def test_reorders_and_persists_projects(self):
        fake = self.make_store()
        with patch("backend.app.routers.projects.store", fake):
            result = reorder_projects({"project_ids": ["project-c", "project-a", "project-b"]})

        self.assertEqual([project["id"] for project in fake.projects], ["project-c", "project-a", "project-b"])
        self.assertEqual(fake.save_calls, 1)
        self.assertEqual(result["status"], "reordered")

    def test_rejects_missing_or_duplicate_projects(self):
        fake = self.make_store()
        with patch("backend.app.routers.projects.store", fake):
            for ids in (["project-a", "project-b"], ["project-a", "project-a", "project-c"]):
                with self.subTest(ids=ids), self.assertRaises(HTTPException) as error:
                    reorder_projects({"project_ids": ids})
                self.assertEqual(error.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
