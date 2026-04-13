import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog
from user_controls.datefield import DateField

import service.reports
import time
import datetime


class ReportsView(BaseView):
    """
    Display a list of reports and gather their required parameters to generate a report.

    Client Period Report
      - date range
      - client
      - project (optional project)

    TimeKeeper Period Report
      - date range
      - timekeeper
      
    Time Period Report
      - date range
    """
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle = "Reports"
        self.reportsService = None
        self.current_report = None
        self.report_data = None
        self.total_hours = 0.0
        self.content = self.build()
        self.dirty = False
        self.startdate = "2023-01-01"

    def getReportsService(self):
        if not self.reportsService:
            self.reportsService = service.reports.ReportsService(
                self.page.session.get("creds")
            )
        return self.reportsService

    def colheader(self, text):
        return ft.DataColumn(
            ft.Container(
                ft.Text(text,
                    weight="w700",
                    text_align="center"
                ),
                bgcolor=ft.colors.BLUE_900,
                padding=15
            )
        )

    def buildtable(self, columns, rows):
        tab = ft.DataTable(
            bgcolor=ft.colors.BLUE_800,
            border_radius=10,
            heading_row_color=ft.colors.BLUE_900,
            columns=[self.colheader(c) for c in columns],
            rows=rows
        )
        return tab

    def refresh(self, e):
        ic("refresh reports view")
        self.page.update()

    def build(self):
        # Report selector tabs
        self.report_tabs = ft.Tabs(
            selected_index=0,
            animation_duration=300,
            tabs=[
                ft.Tab(text="Client Period", icon=ft.icons.BUSINESS),
                ft.Tab(text="TimeKeeper Period", icon=ft.icons.PERSON),
                ft.Tab(text="Time Period", icon=ft.icons.DATE_RANGE),
            ],
            on_change=self.on_tab_change,
            expand=True,
        )

        # ─── Shared: date range fields ──────────────────────────────────
        today = datetime.date.today()
        first_of_month = today.replace(day=1).isoformat()
        last_of_month = (today.replace(day=1) + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
        last_of_month_str = last_of_month.isoformat()

        self.startdate_field = DateField(
            self.page,
            "start_date",
            hint="Start Date",
            val=first_of_month,
            startdate="2023-01-01",
            on_change=self.on_param_change,
        )
        self.enddate_field = DateField(
            self.page,
            "end_date",
            hint="End Date",
            val=last_of_month_str,
            startdate="2023-01-01",
            on_change=self.on_param_change,
        )

        # ─── Client Period Report controls ─────────────────────────────
        self.clientdrop = ft.Dropdown(
            label="Client",
            hint_text="Select client",
            width=350,
            bgcolor=ft.colors.GREY_700,
            focused_border_color=ft.colors.WHITE,
            options=[],
            on_change=self.on_client_change,
        )
        self.projectdrop = ft.Dropdown(
            label="Project (optional)",
            hint_text="Select project",
            width=350,
            bgcolor=ft.colors.GREY_700,
            focused_border_color=ft.colors.WHITE,
            options=[],
        )

        # ─── TimeKeeper Period Report controls ─────────────────────────
        self.timekeeperdrop = ft.Dropdown(
            label="TimeKeeper",
            hint_text="Select timekeeper",
            width=350,
            bgcolor=ft.colors.GREY_700,
            focused_border_color=ft.colors.WHITE,
            options=[],
        )

        # ─── Buttons ─────────────────────────────────────────────────────
        self.run_button = ft.ElevatedButton(
            text="Run Report",
            icon=ft.icons.PLAY_ARROW,
            color="black",
            bgcolor="white",
            on_click=self.run_report,
        )
        self.csv_button = ft.ElevatedButton(
            text="Download CSV",
            icon=ft.icons.DOWNLOAD,
            color="black",
            bgcolor="white",
            on_click=self.download_csv,
            disabled=True,
        )

        # ─── Total hours display ────────────────────────────────────────
        self.total_hours_display = ft.Container(
            content=ft.Row([
                ft.Icon(ft.icons.ACCESS_TIME, color=ft.colors.BLUE_300, size=24),
                ft.Text("Total Hours: 0.0", size=20, weight=ft.FontWeight.BOLD, color=ft.colors.WHITE),
            ], alignment=ft.MainAxisAlignment.END, spacing=8),
            padding=ft.padding.all(15),
            bgcolor=ft.colors.BLUE_800,
            border_radius=8,
            margin=ft.margin.only(top=10),
        )

        # ─── Parameter panel (changes per report type) ──────────────────
        self.param_panel = ft.Column([
            ft.Row([self.clientdrop, self.projectdrop]),
        ])

        # ─── Results table (initially empty) ────────────────────────────
        self.result_table = self.buildtable(["Client", "Resource", "Date", "Hours", "Bill Rate", "Task", "Project"], [])

        # ─── Layout ───────────────────────────────────────────────────────
        body = ft.Column([
            self.report_tabs,
            ft.Row([
                self.startdate_field.content,
                self.enddate_field.content,
            ]),
            self.param_panel,
            ft.Row([
                self.run_button,
                self.csv_button,
            ]),
            self.result_table,
            self.total_hours_display,
        ])
        return body

    def on_tab_change(self, e):
        """Switch parameter panel based on selected report tab."""
        idx = e.control.selected_index
        ic(f"Tab changed to index {idx}")

        self.current_report = idx
        self.report_data = None
        self.csv_button.disabled = True
        self._clear_results()

        if idx == 0:  # Client Period
            self.param_panel.controls = [
                ft.Row([self.clientdrop, self.projectdrop]),
            ]
            self._load_clients()
        elif idx == 1:  # TimeKeeper Period
            self.param_panel.controls = [
                ft.Row([self.timekeeperdrop]),
            ]
            self._load_timekeepers()
        else:  # Time Period
            self.param_panel.controls = [
                ft.Text("No additional parameters needed — just a date range.", color=ft.colors.GREY_400),
            ]

        self.page.update()

    def on_client_change(self, e):
        """When client changes, reload projects for that client."""
        client_id = e.control.value
        if client_id:
            self._load_projects(int(client_id))

    def on_param_change(self, e):
        """Called when any parameter changes."""
        pass

    def _load_clients(self):
        try:
            rows = self.getReportsService().getClients()
        except Exception:
            rows = []
        clientoptions = []
        if rows:
            for row in rows:
                clientoptions.append(ft.dropdown.Option(key=str(row["client_id"]), text=row["organisation"]))
        self.clientdrop.options = clientoptions
        if self.clientdrop.parent is not None:
            self.clientdrop.update()

    def _load_projects(self, client_id):
        try:
            rows = self.getReportsService().getProjects(client_id=client_id)
        except Exception:
            rows = []
        projectoptions = [ft.dropdown.Option(key="", text="All Projects")]
        if rows:
            for row in rows:
                projectoptions.append(ft.dropdown.Option(key=str(row["project_id"]), text=row["title"]))
        self.projectdrop.options = projectoptions
        if self.projectdrop.parent is not None:
            self.projectdrop.update()

    def _load_timekeepers(self):
        try:
            rows = self.getReportsService().getTimekeepers()
        except Exception:
            rows = []
        tkoptions = []
        if rows:
            for row in rows:
                name = f"{row['first_name']} {row['last_name']}"
                tkoptions.append(ft.dropdown.Option(key=str(row["timekeeper_id"]), text=name))
        self.timekeeperdrop.options = tkoptions
        if self.timekeeperdrop.parent is not None:
            self.timekeeperdrop.update()

    def _get_date_params(self):
        """Extract start_date and end_date from the date fields."""
        start_date = self.startdate_field.getValue()
        end_date = self.enddate_field.getValue()
        return start_date, end_date

    def _clear_results(self):
        self.result_table.rows = []
        self.total_hours = 0.0
        self._update_total_hours_display()
        if self.result_table.parent is not None:
            self.result_table.update()

    def _render_results(self, data):
        """Render report data into the results table."""
        if data is None:
            return
        columns = data.get("columns", ["client", "resource", "date", "hours", "bill_rate", "task", "project"])
        rows = data.get("rows", [])
        summary = data.get("summary", {})

        # Update table columns
        self.result_table.columns = [self.colheader(c.replace("_", " ").title()) for c in columns]

        # Render rows
        rendered = []
        for row in rows:
            cells = []
            for col in columns:
                val = row.get(col, "")
                # Format bill_rate as currency
                if col == "bill_rate" and val is not None:
                    try:
                        val = f"${float(val):.2f}"
                    except (ValueError, TypeError):
                        pass
                cells.append(ft.DataCell(ft.Text(str(val) if val is not None else "")))
            rendered.append(ft.DataRow(cells=cells))

        self.result_table.rows = rendered

        # Use summary from API if available, otherwise calculate
        if summary and summary.get("total_hours") is not None:
            self.total_hours = summary["total_hours"]
        else:
            self.total_hours = 0.0
            for row in rows:
                try:
                    self.total_hours += float(row.get("hours", 0))
                except (ValueError, TypeError):
                    pass

        self._update_total_hours_display()
        if self.result_table.parent is not None:
            self.result_table.update()

    def _update_total_hours_display(self):
        if (hasattr(self, 'total_hours_display') and
            self.total_hours_display and
            self.total_hours_display.content and
            len(self.total_hours_display.content.controls) > 1):
            self.total_hours_display.content.controls[1].value = f"Total Hours: {self.total_hours:.1f}"
            if self.total_hours_display.parent is not None:
                self.total_hours_display.update()

    def run_report(self, e):
        """Execute the selected report."""
        start_date, end_date = self._get_date_params()
        ic(f"Running report: start={start_date} end={end_date} tab={self.current_report}")

        if not start_date or not end_date:
            TsNotification(self.page, "Please enter start and end dates", bgcolor="red")
            return

        self.progress(True)
        try:
            if self.current_report == 0:  # Client Period
                client_id = self.clientdrop.value
                if not client_id:
                    TsNotification(self.page, "Please select a client", bgcolor="red")
                    return
                project_id = self.projectdrop.value if self.projectdrop.value else None
                self.report_data = self.getReportsService().getClientPeriodReport(
                    start_date, end_date, int(client_id), project_id=int(project_id) if project_id else None
                )
            elif self.current_report == 1:  # TimeKeeper Period
                timekeeper_id = self.timekeeperdrop.value
                if not timekeeper_id:
                    TsNotification(self.page, "Please select a timekeeper", bgcolor="red")
                    return
                self.report_data = self.getReportsService().getTimekeeperPeriodReport(
                    start_date, end_date, int(timekeeper_id)
                )
            else:  # Time Period
                self.report_data = self.getReportsService().getTimePeriodReport(
                    start_date, end_date
                )

            if self.report_data:
                self._render_results(self.report_data)
                self.csv_button.disabled = False
                TsNotification(self.page, f"Report generated: {len(self.report_data.get('rows', []))} rows", bgcolor="green")
            else:
                TsNotification(self.page, "Report returned no data or failed", bgcolor="red")
        finally:
            self.progress(False)
        self.page.update()

    def download_csv(self, e):
        """Download the current report as CSV."""
        start_date, end_date = self._get_date_params()
        if not start_date or not end_date:
            TsNotification(self.page, "No report to download", bgcolor="red")
            return

        self.progress(True)
        try:
            csv_content = None
            if self.current_report == 0:  # Client Period
                client_id = self.clientdrop.value
                if not client_id:
                    return
                project_id = self.projectdrop.value if self.projectdrop.value else None
                csv_content = self.getReportsService().getClientPeriodCsv(
                    start_date, end_date, int(client_id), project_id=int(project_id) if project_id else None
                )
            elif self.current_report == 1:  # TimeKeeper Period
                timekeeper_id = self.timekeeperdrop.value
                if not timekeeper_id:
                    return
                csv_content = self.getReportsService().getTimekeeperPeriodCsv(
                    start_date, end_date, int(timekeeper_id)
                )
            else:  # Time Period
                csv_content = self.getReportsService().getTimePeriodCsv(
                    start_date, end_date
                )

            if csv_content:
                # Save CSV to a temp file and offer download
                import tempfile
                import os
                tmpdir = tempfile.gettempdir()
                fname = f"report_{self.current_report}_{start_date}_{end_date}.csv"
                fpath = os.path.join(tmpdir, fname)
                with open(fpath, "w") as f:
                    f.write(csv_content)
                ic(f"CSV saved to {fpath}")
                TsNotification(self.page, f"CSV saved to {fpath}", bgcolor="green")
            else:
                TsNotification(self.page, "CSV download failed", bgcolor="red")
        finally:
            self.progress(False)
        self.page.update()

    def render(self):
        ic("render reports view")
        self.content = self.build()
        # Set current_report to match default tab
        self.current_report = 0
        self._load_clients()

    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        if self.dirty:
            self.refresh(None)