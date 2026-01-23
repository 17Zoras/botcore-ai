def get_recommendation(sales_change, ads_change, region):
    if sales_change < 0 and ads_change > 0:
        return (
            f"Sales declined while ad spend increased. "
            f"This indicates inefficient advertising, particularly in {region}. "
            f"Reduce ad spend in this region and shift budget to higher-performing areas."
        )

    if sales_change < 0 and ads_change <= 0:
        return (
            f"Sales are declining despite controlled ad spend. "
            f"The issue appears operational or demand-related in {region}. "
            f"Investigate pricing, product-market fit, or regional demand."
        )

    return (
        "Sales are stable or growing. "
        "Current strategy is working. Consider scaling top-performing regions cautiously."
    )
