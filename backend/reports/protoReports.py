import marimo

__generated_with = "0.11.13"
app = marimo.App(width="medium", app_title="protoReports")


@app.cell
def _():
    import marimo as mo
    from sqlalchemy import create_engine, text
    from datetime import datetime
    import os
    import pandas as pd
    return create_engine, datetime, mo, os, pd, text


@app.cell
def _(os):
    saurl = os.getenv("TIMESHEET_SA_URL")
    return (saurl,)


@app.cell
def _(create_engine, os, pd, saurl, text):
    engine = create_engine(saurl)

    sql="""
    select 'Continental - landlord.com' Client, 
           t.first_name || ' ' || t.last_name Resource, 
           DATE(e.start_time) Date, 
           round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as Hours, 
           t.bill_rate 'Billing Rate', 
           e.log_message Task   
      from billing_event e, timekeeper t
      where e.timekeeper_id=t.timekeeper_id and 
            e.project_id=1  and 
            start_time > date('2025-02-01') and 
            start_time < date('2025-03-01') order by trans_num;
    """

    stmt = text(sql)

    print(stmt)

    rowdf=None
    with engine.connect() as conn:
        rows=conn.execute(stmt)

        rowdf = pd.DataFrame(rows.fetchall(), columns=rows.keys())


    rowdf.to_csv('output.tab', sep='\t', index=False, na_rep='NULL')
    os.system('ls -l output.tab')
    rowdf
    return conn, engine, rowdf, rows, sql, stmt


@app.cell
def _():
    # EarthMatrix
    return


@app.cell
def _(engine, mo):
    _df = mo.sql(
        f"""
            select 'Continental - landlord.com' Client, 
                   t.first_name || ' ' || t.last_name Resource, 
                   DATE(e.start_time) Date, 
                   round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as Hours, 
                   t.bill_rate 'Billing Rate', 
                   e.log_message Task   
              from billing_event e, timekeeper t
              where e.timekeeper_id=t.timekeeper_id and 
                    e.project_id=1  and 
                    start_time > date('2025-02-01') and 
                    start_time < date('2025-03-01') order by trans_num;
        """,
        engine=engine
    )
    return


@app.cell
def _():
    # SOM - Ride
    return


@app.cell
def _(engine, mo):
    _df = mo.sql(
        f"""
            SELECT 'SOM - RIDE - Maintenance' Client, 
                   t.first_name || ' ' || t.last_name Resource, 
                   DATE(e.start_time) Date, 
                   round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as Hours, 
                   62.00 'Billing Rate', 
                   e.log_message Task   
              FROM billing_event e, timekeeper t
              WHERE t.timekeeper_id = 1 AND
                    e.timekeeper_id=t.timekeeper_id and 
                    e.project_id=6  and 
                    start_time > date('2025-03-01') and 
                    start_time < date('2025-04-01') 
                ORDER BY trans_num

        """,
        engine=engine
    )
    return


if __name__ == "__main__":
    app.run()
