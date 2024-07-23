import os

LOGGER_NAME="main"

saurl = os.getenv("TIMESHEET_SA_URL")
assert (
    saurl
), "TIMESHEET_SA_URL is not set! Please set the envrionment var and try again!"


def getSqlalchemyUrl():
    return saurl
