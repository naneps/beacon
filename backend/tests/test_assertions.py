import unittest

from backend.app.core.tester import evaluate_assertions


class AssertionEvaluationTests(unittest.TestCase):
    def test_typed_values_and_failure_messages(self):
        result = {
            "status": 201,
            "time_ms": 125,
            "body": '{"ok":true}',
            "json": {"ok": True, "count": 3},
            "headers": {"Content-Type": "application/json; charset=utf-8"},
        }
        assertions = [
            {"type": "status", "op": "gte", "value": 200},
            {"type": "status", "op": "lt", "value": 300},
            {"type": "jsonpath", "path": "body.ok", "op": "eq", "value": True},
            {"type": "time_ms", "op": "lt", "value": 100},
        ]

        evaluated = evaluate_assertions(assertions, result)

        self.assertEqual([item["ok"] for item in evaluated], [True, True, True, False])
        self.assertEqual(evaluated[-1]["actual"], 125)
        self.assertIn("response time", evaluated[-1]["message"])
        self.assertIn("received 125", evaluated[-1]["message"])

    def test_missing_json_path_reports_none(self):
        evaluated = evaluate_assertions(
            [{"type": "jsonpath", "path": "body.data.id", "op": "exists"}],
            {"json": {}, "headers": {}, "body": ""},
        )

        self.assertFalse(evaluated[0]["ok"])
        self.assertIn("JSON path body.data.id", evaluated[0]["message"])


if __name__ == "__main__":
    unittest.main()
