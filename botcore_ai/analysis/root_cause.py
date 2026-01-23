def worst_region(df):
    region_sales = df.groupby("region")["sales"].sum()
    return region_sales.idxmin()
