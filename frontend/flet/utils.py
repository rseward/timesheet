
def isEmpty(val: str) -> bool:
    empty=False
    
    if val is None:
        empty=True
    if isinstance(val, str) and len(val)==0:
        empty=True
        
    return empty
