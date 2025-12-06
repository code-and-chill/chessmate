from fastapi import FastAPI

from app.api.routes.v1 import insights

app = FastAPI(title="insights-api")
app.include_router(insights.router)


@app.get("/")
def root():
    return {"service": "insights-api", "status": "ok"}
