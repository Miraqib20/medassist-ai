import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from seed import seed_database

if __name__ == "__main__":
    seed_database()
