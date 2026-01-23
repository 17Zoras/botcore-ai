def generate_report(sales_change, ads_change, region, recommendation):
    return f"""
BUSINESS SUMMARY
Sales changed by {sales_change}% while ad spend changed by {ads_change}%.

ROOT CAUSE
The weakest performance is coming from the {region} region, which is contributing the most to the decline.

RECOMMENDED ACTION
{recommendation}

CONFIDENCE NOTE
This recommendation is based on comparative performance across time periods and regions.
"""
