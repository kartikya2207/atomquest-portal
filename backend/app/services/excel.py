import pandas as pd
from typing import List, Dict, Any
import io

def parse_user_upload(file_content: bytes, content_type: str) -> List[Dict[str, Any]]:
    """
    Parses CSV or XLSX content and returns a list of dictionaries.
    Expected columns: email, name, role, department, designation, manager_email
    """
    if content_type == "text/csv":
        df = pd.read_csv(io.BytesIO(file_content))
    else:
        df = pd.read_excel(io.BytesIO(file_content))
    
    # Basic cleanup
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records")
