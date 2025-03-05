# Reports

Quick stab at specifying reports needed for the project.

## Client Period Report

```
select 'Continental - landlord.com', t.first_name || ' ' || t.last_name, e.start_time, round( (julianday(e.end_time) - julianday(e.start_time))*24,1) as hours, t.bill_rate, e.log_message    
  from billing_event e, timekeeper t
  where e.timekeeper_id=t.timekeeper_id and 
        e.project_id=1  and 
        start_time > date('2025-02-01') and 
        start_time < date('2025-03-01') order by trans_num;
```

## TimeKeeper Period Report

## Time Period Report