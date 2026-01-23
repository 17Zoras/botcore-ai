import streamlit as st
from analysis.load_data import load_csv
from analysis.analyze_sales import sales_and_ads_change
from analysis.root_cause import worst_region
from rules.decision_rules import get_recommendation
from reports.report_generator import generate_report
from reports.ai_explainer import ai_rewrite

st.title("BotCore.ai — AI Decision Reports")

# ---------- USAGE LIMIT ----------
if "uses" not in st.session_state:
    st.session_state.uses = 0

MAX_FREE_USES = 1
# ---------------------------------

file = st.file_uploader("Upload your sales CSV", type=["csv"])

if file:
    df = load_csv(file)

    sales_change, ads_change = sales_and_ads_change(df)
    region = worst_region(df)

    recommendation = get_recommendation(
        sales_change,
        ads_change,
        region
    )

    raw_report = generate_report(
        sales_change,
        ads_change,
        region,
        recommendation
    )

    st.subheader("Business Analysis (Logic-Based)")
    st.text(raw_report)

    if st.session_state.uses < MAX_FREE_USES:
        if st.button("Generate AI Executive Report"):
            with st.spinner("Generating AI explanation..."):
                ai_report = ai_rewrite(raw_report)
                st.session_state.uses += 1
                st.subheader("Executive Decision Report")
                st.write(ai_report)
    else:
        st.warning("Free AI report limit reached. Upgrade to continue.")
