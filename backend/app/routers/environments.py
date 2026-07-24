import uuid

from fastapi import APIRouter, HTTPException

from ..state import store

router = APIRouter(tags=["environments"])


@router.post("/projects/{project_id}/environments")
def create_environment(project_id: str, data: dict):
    proj = next((p for p in store.projects if p.get("id") == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    env_id = str(uuid.uuid4())
    new_env = {
        "id": env_id,
        "name": data.get("name", "New Env"),
        "base_url": data.get("base_url", ""),
        "variables": data.get("variables", {}),
    }
    if "environments" not in proj:
        proj["environments"] = []
    proj["environments"].append(new_env)
    proj["current_environment_id"] = env_id
    store.sync_current_config()
    store.save()
    return new_env


@router.post("/projects/{project_id}/environments/{env_id}/switch")
def switch_environment(project_id: str, env_id: str):
    proj = next((p for p in store.projects if p.get("id") == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    envs = proj.get("environments", [])
    if not any(e.get("id") == env_id for e in envs):
        raise HTTPException(status_code=404, detail="Environment not found")
    proj["current_environment_id"] = env_id
    store.sync_current_config()
    store.save()
    return {"status": "switched", "config": store.current_config.to_dict()}


@router.put("/projects/{project_id}/environments/{env_id}/variables/{name}")
def capture_environment_variable(project_id: str, env_id: str, name: str, data: dict):
    """Atomically persist one captured response value without replacing other
    variables that a concurrent Send/extractor may just have refreshed."""
    variable_name = str(name or "").strip()
    if not variable_name:
        raise HTTPException(status_code=400, detail="Variable name is required")
    if "value" not in data:
        raise HTTPException(status_code=400, detail="Variable value is required")
    proj = next((p for p in store.projects if p.get("id") == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    env = next((e for e in proj.get("environments", []) if e.get("id") == env_id), None)
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    variables = env.setdefault("variables", {})
    variables[variable_name] = data["value"]
    if project_id == store.current_project_id and env_id == proj.get("current_environment_id"):
        store.sync_current_config()
    store.save()
    return {"status": "captured", "name": variable_name}
