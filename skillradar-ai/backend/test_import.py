import sys
import traceback
try:
    import main
    print("Success")
except BaseException as e:
    with open("err.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Error written to err.txt")
