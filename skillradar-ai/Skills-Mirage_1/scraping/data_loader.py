import pandas as pd

def load_dataset():

    jobs = pd.read_csv("datasets/NaukriData_Data Science.csv")

    jobs = jobs.dropna()

    return jobs