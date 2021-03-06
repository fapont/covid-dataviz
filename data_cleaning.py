import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

class barchartrace:
    def __init__(self):
        self.df = pd.read_csv("web/data/covid-data.csv")
        
    def clean_generate(self):
        df = self.df
        df = pd.read_csv("web/data/covid-data.csv")
        df["date"] = pd.to_datetime(df["date"])
        df = df[["date", "location", "total_cases", "total_deaths", "people_vaccinated", "people_fully_vaccinated"]]
        df = df.rename(columns={"date":"year", "location" : "name"})
        cols = df.columns[2:]
        df["year"] = df["year"].apply(lambda x: round(x.isocalendar()[0] + x.isocalendar()[1]/52, 1))
        cont = ["Europe", "Asia", "North America", "Africa", "Oceania", "World", "South America", "European Union", "International", "Thailand"]
        df = df[~df["name"].isin(cont)]

        for col in cols:
                    df = df.rename(columns={col : "value"})
                    df = df.fillna(0)
                    df = df.sort_values(["year", "value"], ascending=[True, False])
                    
                    df = df.groupby(["year", "name"]).mean().reset_index()
                    
                    df["rank"] = df.groupby("year").rank(method="max", ascending=False)["value"].astype(int)
                    df = df.replace(0, np.nan)
                    df = df.iloc[5:,:]
                    df = df.sort_values(["name", "year"], ascending=[True, False])
                    df["lastValue"] = 0
                    df_tot = pd.DataFrame()
                    for pays in df["name"].unique():
                        df_temp = df[df["name"]==pays].copy()
                        df_temp["lastValue"] = df_temp["value"].shift(periods=-1).fillna(0)
                        df_tot = pd.concat([df_tot,df_temp])
                    df_tot = df_tot.sort_values(["name", "year"], ascending=[True, False])
                    for i,name in enumerate(df_tot.loc[df_tot["year"] == 2020.1].sort_values("value", ascending= False)['name'].unique()):
                        df_tot = df_tot.append({'year':2020.0,'name':name,'value':0,'new_cases':0, 'lastValue':0, 'rank':i+1}, ignore_index=True)
                    df_tot.to_csv(f"web/data/chartrace_{col}.csv")
                    df = df.drop("value", axis=1)
            
