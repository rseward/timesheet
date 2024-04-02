from pydantic import BaseModel
from typing import Optional  # , List


class ClientJson(BaseModel):
    client_id: int
    organisation: str
    description: Optional[str]
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: str
    contact_first_name: str
    contact_last_name: str
    username: str
    contact_email: str
    phone_number: str
    fax_number: Optional[str] = None
    gsm_number: Optional[str] = None
    http_url: Optional[str] = None
