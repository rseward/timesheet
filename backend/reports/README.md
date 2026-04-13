# Reports

Quick stab at specifying reports needed for the project.

## Client Period Report

```sql
select 'Continental - landlord.com', t.first_name || ' ' || t.last_name, e.start_time, round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as hours, t.bill_rate, e.log_message    
  from billing_event e, timekeeper t
  where e.timekeeper_id=t.timekeeper_id and 
        e.project_id=1  and 
        start_time > date('2025-02-01') and 
        start_time < date('2025-03-01') order by trans_num;
```

## TimeKeeper Period Report

```sql
SELECT c.organisation Client,
       p.title Project,
       t.first_name || ' ' || t.last_name Resource,
       DATE(e.start_time) Date,
       round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as Hours,
       t.bill_rate 'Billing Rate',
       e.log_message Task
  FROM billing_event e, timekeeper t, project p, client c
  WHERE e.timekeeper_id=t.timekeeper_id AND
        e.project_id=p.project_id AND
        p.client_id=c.client_id AND
        e.timekeeper_id = :timekeeper_id AND
        e.start_time >= :start_date AND
        e.start_time <= :end_date AND
        e.active = 1
  ORDER BY e.start_time;
```

API endpoint: `GET /api/reports/timekeeper-period?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&timekeeper_id=N`
CSV export:   `GET /api/reports/timekeeper-period/csv?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&timekeeper_id=N`

## Time Period Report


# Prototype Reports

protoReports.py is a quick marimo facility to generate the report outputs. When the reporting requirments become more fully formed, a more complete facility will be integrated into the flet app and eventually the react app.
