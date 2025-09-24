# Step-by-Step Guide: Connecting Salesforce → BigQuery → Looker Studio for Savvy Wealth KPI Dashboards

Based on the Q4 2025 GTM Forecast planning sessions, the primary goal is to operationalize forecasting and KPI reporting (SQOs, conversion rates by channel, seasonal adjustments, pipeline health, etc.) in a scalable BI stack. The optimal approach is to create a **Salesforce → BigQuery** ETL pipeline, then model and expose data through **Looker Studio** dashboards.&#x20;

---

## Step 1: Define KPIs & Metrics (from Q4 Forecast Notes)

**High-priority KPIs to include**

* **Pipeline & Opportunities**

  * SQOs created *(Q4 target ≈ 139)*
* **Channel Conversions**

  * Outbound *(provided list, self-sourced)*
  * Inbound *(Ashby/admissions, events)*
  * Ecosystem *(recruiters, advisor referrals, re-engagement)*
* **Conversion Rates**

  * MQL → SQL, SQL → SQO, SQO → Join *(by channel)*
* **Seasonality Adjustment**

  * December productivity factor = **60%** of baseline volume
* **Operational Insights**

  * Lead routing gaps *(Ashby → Salesforce)*
  * Recruiter flow tracking
  * Re-engagement alerts

---

## Step 2: Connect Salesforce to BigQuery

**Replication options**

* **Google Data Connector for Salesforce** *(in BigQuery)*
  Lightweight scheduled imports; limited schema coverage.
* **ETL Tools: Fivetran, Stitch, Airbyte**
  Managed pipelines for Salesforce objects into BigQuery (incremental syncs, schema handling, reliable updates).

**Recommended**: Start with **Fivetran** or **Airbyte**.

**Setup checklist**

1. Create a **BigQuery project** in Google Cloud Console.
2. Create a **dataset** (e.g., `savvy_salesforce`).
3. Configure your ETL tool (e.g., **Fivetran → Salesforce → BigQuery**) and authenticate Salesforce via OAuth.
4. **Select objects to sync**

   * `Lead` *(with MQL/SQL stages, source detail)*
   * `Opportunity` *(tracking SQO, close rates, revenue where applicable)*
   * `Campaign` + `CampaignMember` *(segment inbound, events, referrals)*
   * **Custom objects** for ATS/Ashby routing & recruitment-firm events (if used)
5. **Schedule sync**: hourly or daily, based on refresh needs.

---

## Step 3: Transform Data in BigQuery

**Dimensional modeling**

* Create views for **Leads**, **Opportunities**, **Accounts**, **Campaigns**.

**Channel attribution (map source → channel)**

* **Outbound** = provided lists, self-sourced
* **Inbound** = website, events, ATS (Ashby)
* **Ecosystem** = recruiters, referrals, re-engagement

**Conversions (funnel steps)**

* **MQL** *(call scheduled)* → **SQL** → **SQO** → **Join**

**Forecast/Reporting views**

* `sqo_forecast_by_month` *(Oct–Dec projections)*
* `conversion_rates_by_channel`
* `pipeline_snapshot` *(open vs. closed opps)*

---

## Step 4: Connect BigQuery to Looker Studio

1. Open **Looker Studio**.
2. **Create data source** → choose **BigQuery** → authenticate.
3. Select dataset **`savvy_salesforce`**.
4. Import the **clean reporting tables** *(conversion rates, SQOs, pipeline snapshots)*.

---

## Step 5: Build KPI Dashboards

**Executive KPI Summary**

* SQOs by month vs. target *(goal: 139)*
* **Joins vs. SQO conversion %**
* December **seasonal scaling** applied

**Channel Performance Dashboard**

* Volume **Leads → MQLs → SQLs → SQOs** by channel
* **Conversion rates by channel** (compare to planned assumptions)
* Benchmark vs. **Q3 baseline (\~115 SQOs)**

**Operational Insights**

* **Leads missing routing** *(from Ashby migration issues)*
* **Recruitment-firm introductions → pipeline impact**
* **Re-engagement opportunities** opened vs. forecasted *(3/4/5 per month)*

---

## Step 6: Automate & Operationalize

* **Scheduling**: Refresh BigQuery ETL nightly *(or hourly if SFDC activity is high)*.
* **Alerts**: Conditional formatting in Looker Studio
  *(e.g., flag if MQL → SQL falls below forecast assumptions)*.
* **Documentation**: Standardize definitions across ops/GTM/analytics
  *(e.g., **MQL = call scheduled**, **SQO = Sales Qualified Opportunity**)*.
* **Iterate**: Evolve dashboards per BI roadmap *(lead-scoring redesign, automation for re-engagement alerts)*.

---

## Sources

* Q4 2025 GTM Forecast Working Session (Sessions 1–2)
* Q4 2025 GTM Forecast Build (Sessions 1–2)

*Original content reformatted from the provided file.*&#x20;
