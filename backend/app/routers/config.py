from fastapi import APIRouter

from ..core.tester import TestConfig
from ..state import store

router = APIRouter(tags=["config"])


@router.get("/config")
def get_config():
    store.reload_if_changed()  # reflect out-of-process (MCP) edits
    return store.current_config.to_dict()


@router.post("/config")
def save_config_route(data: dict):
    store.current_config = TestConfig.from_dict(data)
    store.save()
    return {"status": "saved", "project_id": store.current_project_id}
