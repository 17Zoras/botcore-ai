def sales_and_ads_change(df):
    monthly_sales = df.groupby("date")["sales"].sum()
    monthly_ads = df.groupby("date")["ad_spend"].sum()

    sales_change = ((monthly_sales.iloc[-1] - monthly_sales.iloc[0]) / monthly_sales.iloc[0]) * 100
    ads_change = ((monthly_ads.iloc[-1] - monthly_ads.iloc[0]) / monthly_ads.iloc[0]) * 100

    return round(sales_change, 2), round(ads_change, 2)
