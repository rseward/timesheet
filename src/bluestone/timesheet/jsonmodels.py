
from pydantic import BaseModel

class ClientJson(BaseModel):
    client_id: int
    organisation: str
    description: str
    address1: str
    address2: str
    city: str
    state: str
    country: str
    postal_code: str
    contact_first_name: str
    contact_last_name: str
    username: str
    contact_email: str
    phone_number: str
    fax_number: str
    gsm_number: str
    http_url: str