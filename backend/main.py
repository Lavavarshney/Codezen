# D:/codezen/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mftool import Mftool
import pandas as pd
import numpy as np
from typing import Dict, List, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
mf = Mftool()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to convert scheme codes
scheme_names = {v: k for k, v in mf.get_scheme_codes().items()}

# Helper function to flatten and stringify response data
def stringify_dict(data: Dict[str, Any]) -> Dict[str, str]:
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = str(value)
        else:
            result[key] = str(value)
    return result

@app.get("/api/schemes")
async def get_schemes(amc: str = "ICICI") -> Dict[str, str]:
    try:
        schemas = mf.get_available_schemes(amc)
        if schemas:
            return schemas
        logger.info(f"No schemes found for AMC: {amc}")
        return {}
    except Exception as e:
        logger.error(f"Error fetching schemes for AMC {amc}: {str(e)}")
        raise

@app.get("/api/scheme-details/{scheme_code}")
async def get_scheme_details(scheme_code: str) -> Dict[str, str]:
    try:
        details = mf.get_scheme_details(scheme_code)
        if details:
            return stringify_dict(details)
        logger.info(f"No details found for scheme_code: {scheme_code}")
        return {}
    except Exception as e:
        logger.error(f"Error fetching scheme details for {scheme_code}: {str(e)}")
        raise

@app.get("/api/historical-nav/{scheme_code}")
async def get_historical_nav(scheme_code: str) -> List[Dict[str, str]]:
    try:
        nav_data = mf.get_scheme_historical_nav(scheme_code, as_Dataframe=True)
        if nav_data is not None and not nav_data.empty:
            # Ensure all values are strings for Dict[str, str]
            nav_data = nav_data.astype(str)
            return nav_data.to_dict(orient="records")
        logger.info(f"No historical NAV data found for scheme_code: {scheme_code}")
        return []
    except Exception as e:
        logger.error(f"Error fetching historical NAV for {scheme_code}: {str(e)}")
        raise

@app.get("/api/compare-navs")
async def compare_navs(scheme_codes: str) -> List[Dict[str, str]]:
    try:
        codes = scheme_codes.split(",")
        if not codes:
            logger.info("No scheme codes provided for comparison")
            return []

        comparison_data = {}
        for code in codes:
            data = mf.get_scheme_historical_nav(code, as_Dataframe=True)
            if data is not None and not data.empty:
                data = data.reset_index().rename(columns={"index": "date"})
                data["date"] = pd.to_datetime(data["date"], dayfirst=True).dt.strftime("%Y-%m-%d")
                data["nav"] = pd.to_numeric(data["nav"], errors="coerce").replace(0, None).interpolate()
                comparison_data[code] = data[["date", "nav"]].to_dict(orient="records")
            else:
                logger.info(f"No historical NAV data found for scheme_code: {code}")

        if comparison_data:
            merged_df = None
            for code, records in comparison_data.items():
                df = pd.DataFrame(records).set_index("date")
                df = df.rename(columns={"nav": scheme_names.get(code, code)})
                if merged_df is None:
                    merged_df = df
                else:
                    merged_df = merged_df.join(df, how="outer")
            merged_df = merged_df.reset_index()
            return merged_df.to_dict(orient="records")
        logger.info(f"No valid data to compare for scheme_codes: {scheme_codes}")
        return []
    except Exception as e:
        logger.error(f"Error comparing NAVs for {scheme_codes}: {str(e)}")
        raise

@app.get("/api/average-aum")
async def get_average_aum(period: str = "July - September 2024") -> List[Dict[str, str]]:
    try:
        aum_data = mf.get_average_aum(period, False)
        if aum_data:
            aum_df = pd.DataFrame(aum_data)
            aum_df["Total AUM"] = aum_df[["AAUM Overseas", "AAUM Domestic"]].astype(float).sum(axis=1)
            return aum_df[["Fund Name", "Total AUM"]].astype(str).to_dict(orient="records")
        logger.info(f"No AUM data found for period: {period}")
        return []
    except Exception as e:
        logger.error(f"Error fetching AUM for period {period}: {str(e)}")
        raise

@app.get("/api/performance-heatmap/{scheme_code}")
async def get_performance_heatmap(scheme_code: str) -> List[Dict[str, float]]:
    try:
        nav_data = mf.get_scheme_historical_nav(scheme_code, as_Dataframe=True)
        if nav_data is not None and not nav_data.empty:
            nav_data = nav_data.reset_index().rename(columns={"index": "date"})
            nav_data["month"] = pd.to_datetime(nav_data["date"]).dt.month
            nav_data["nav"] = nav_data["nav"].astype(float)
            heatmap_data = nav_data.groupby("month")["dayChange"].mean().reset_index()
            heatmap_data["month"] = heatmap_data["month"].astype(str)
            return heatmap_data.to_dict(orient="records")
        logger.info(f"No historical NAV data found for heatmap, scheme_code: {scheme_code}")
        return []
    except Exception as e:
        logger.error(f"Error fetching performance heatmap for {scheme_code}: {str(e)}")
        raise

@app.get("/api/risk-volatility/{scheme_code}")
async def get_risk_volatility(scheme_code: str) -> Dict[str, Any]:
    try:
        nav_data = mf.get_scheme_historical_nav(scheme_code, as_Dataframe=True)
        if nav_data is not None and not nav_data.empty:
            nav_data = nav_data.reset_index().rename(columns={"index": "date"})
            nav_data["date"] = pd.to_datetime(nav_data["date"], dayfirst=True)
            nav_data["nav"] = pd.to_numeric(nav_data["nav"], errors="coerce")
            nav_data = nav_data.dropna(subset=["nav"])
            nav_data["returns"] = nav_data["nav"] / nav_data["nav"].shift(1) - 1
            nav_data = nav_data.dropna(subset=["returns"])

            annualized_volatility = nav_data["returns"].std() * np.sqrt(252)
            annualized_return = (nav_data["returns"].mean() + 1) ** 252 - 1
            risk_free_rate = 0.06
            sharpe_ratio = (annualized_return - risk_free_rate) / annualized_volatility

            return {
                "annualized_volatility": annualized_volatility,
                "annualized_return": annualized_return,
                "sharpe_ratio": sharpe_ratio,
                "returns": nav_data[["date", "returns"]].to_dict(orient="records")
            }
        logger.info(f"No historical NAV data found for risk analysis, scheme_code: {scheme_code}")
        return {}
    except Exception as e:
        logger.error(f"Error fetching risk volatility for {scheme_code}: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)