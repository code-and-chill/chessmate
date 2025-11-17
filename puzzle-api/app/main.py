from fastapi import FastAPI, Depends
from app.api import puzzles, admin, user

app = FastAPI()

# Include routers
app.include_router(puzzles.router, prefix="/api/v1/puzzles", tags=["Puzzles"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(user.router, prefix="/api/v1/puzzles/user", tags=["User"])

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}