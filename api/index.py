# gnn-network-forecaster/api/index.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx
import os

# Địa chỉ của server GNN, lắng nghe trên cổng 8889
COMPUTE_SERVER_URL = os.getenv("COMPUTE_SERVER_URL_GNN", "http://14.232.208.84:8888")

app = FastAPI(title="PoC#2 Vercel Proxy Gateway")

@app.get("/api/hello")
def get_hello():
    return JSONResponse(content={"message": f"PoC#2 Proxy is running and configured for: {COMPUTE_SERVER_URL}"})

@app.post("/api/forecast")
async def proxy_forecast(request: Request):
    """
    Proxy cho endpoint /forecast.
    """
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{COMPUTE_SERVER_URL}/forecast", 
                json=payload, 
                timeout=60.0
            )
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"Compute server error: {exc.response.text}")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not connect to compute server: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal proxy error: {str(exc)}")
