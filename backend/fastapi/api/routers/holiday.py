from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from datetime import date

import bluestone.timesheet.config as cfg
from bluestone.timesheet.jsonmodels import HolidayJson

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.auth.auth_bearer import JWTBearer

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/holidays",
    tags=["holidays"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    response_model=dict[str, dict[int, HolidayJson]],
    dependencies=[Depends(JWTBearer())],
)
def index(active: bool = True, client_id: int | None = None, year: int | None = None) -> dict[str, dict[int, HolidayJson]]:
    hmap = {}
    holidayDao = daos.getHolidayDao()

    for dbholiday in holidayDao.getAll(include_inactive=not(active), client_id=client_id, year=year):
        j = holidayDao.toJson(dbholiday)
        j.client_name = None
        if dbholiday.client_id != 0:
            clientDao = daos.getClientDao()
            client = clientDao.getById(dbholiday.client_id)
            if client:
                j.client_name = client.organisation
        else:
            j.client_name = "Federal"
        hmap[j.holiday_id] = j

    res = {"holidays": hmap}
    return res


@router.get(
    "/{holiday_id}",
    response_model=dict[str, HolidayJson],
    dependencies=[Depends(JWTBearer())],
)
def holiday_by_id(holiday_id: int) -> dict[str, HolidayJson]:
    holidayDao = daos.getHolidayDao()
    dbholiday = holidayDao.getById(holiday_id)

    if not(dbholiday):
        raise HTTPException(status_code=404, detail=f"Holiday with holiday_id={holiday_id} does not exist.")

    j = holidayDao.toJson(dbholiday)
    j.client_name = None
    if dbholiday.client_id != 0:
        clientDao = daos.getClientDao()
        client = clientDao.getById(dbholiday.client_id)
        if client:
            j.client_name = client.organisation
    else:
        j.client_name = "Federal"

    return {"holiday": j}


@router.get(
    "/federal",
    response_model=dict[str, dict[int, HolidayJson]],
    dependencies=[Depends(JWTBearer())],
)
def federal_holidays(year: int | None = None) -> dict[str, dict[int, HolidayJson]]:
    hmap = {}
    holidayDao = daos.getHolidayDao()

    for dbholiday in holidayDao.getFederalHolidays(year=year):
        j = holidayDao.toJson(dbholiday)
        j.client_name = "Federal"
        hmap[j.holiday_id] = j

    return {"holidays": hmap}


@router.get(
    "/client/{client_id}",
    response_model=dict[str, dict[int, HolidayJson]],
    dependencies=[Depends(JWTBearer())],
)
def client_holidays(client_id: int, year: int | None = None) -> dict[str, dict[int, HolidayJson]]:
    hmap = {}
    holidayDao = daos.getHolidayDao()

    for dbholiday in holidayDao.getAll(client_id=client_id, year=year):
        j = holidayDao.toJson(dbholiday)
        clientDao = daos.getClientDao()
        client = clientDao.getById(dbholiday.client_id)
        if client:
            j.client_name = client.organisation
        hmap[j.holiday_id] = j

    return {"holidays": hmap}


@router.get(
    "/check-date",
    response_model=dict[str, any],
    dependencies=[Depends(JWTBearer())],
)
def check_date_is_holiday(client_id: int, date: date) -> dict[str, any]:
    holidayDao = daos.getHolidayDao()
    holiday = holidayDao.checkDateIsHoliday(client_id, date)

    result = {
        "is_holiday": holiday is not None,
        "date": date.isoformat()
    }

    if holiday:
        result["holiday_type"] = "federal" if holiday.client_id == 0 else "client"
        result["holiday_name"] = holiday.name
        result["holiday_description"] = holiday.description
        result["message"] = f"{date.strftime('%B %d, %Y')} is a {result['holiday_type']} holiday: {holiday.name}"
    else:
        result["holiday_type"] = None
        result["holiday_name"] = None
        result["message"] = None

    return result


@router.post(
    "/",
    response_model=dict[str, HolidayJson],
    dependencies=[Depends(JWTBearer())],
)
def holiday_add(js: HolidayJson) -> dict[str, HolidayJson]:
    holidayDao = daos.getHolidayDao()
    if js.holiday_id == 0:
        js.holiday_id = None

    if js.holiday_id:
        dbrec = holidayDao.getById(js.holiday_id)
        if dbrec:
            raise HTTPException(status_code=400, detail=f"Holiday with holiday_id={js.holiday_id} already exists.")

    dbrec = holidayDao.toModel(js)
    try:
        holidayDao.save(dbrec)
        holidayDao.flush()
        holidayDao.refresh(dbrec)
        js.holiday_id = dbrec.holiday_id
        holidayDao.commit()
        return {"added": js}
    except Exception as e:
        holidayDao.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put(
    "/",
    response_model=dict[str, HolidayJson],
    dependencies=[Depends(JWTBearer())],
)
def holiday_update(js: HolidayJson) -> dict[str, HolidayJson]:
    holidayDao = daos.getHolidayDao()
    dbrec = holidayDao.getById(js.holiday_id)

    if dbrec is None:
        raise HTTPException(status_code=404, detail=f"Holiday with holiday_id={js.holiday_id} does not exist.")

    try:
        dbrec = holidayDao.update(dbrec, js)
        holidayDao.commit()
        return {"updated": holidayDao.toJson(dbrec)}
    except Exception as e:
        holidayDao.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{holiday_id}",
    response_model=dict[str, HolidayJson],
    dependencies=[Depends(JWTBearer())],
)
def holiday_delete(holiday_id: int) -> dict[str, HolidayJson]:
    holidayDao = daos.getHolidayDao()
    dbrec = holidayDao.getById(holiday_id)

    if dbrec is None:
        raise HTTPException(status_code=400, detail=f"Holiday with holiday_id={holiday_id} does not exist.")

    holidayDao.delete(holiday_id)
    holidayDao.commit()

    return {"deleted": holidayDao.toJson(dbrec)}
