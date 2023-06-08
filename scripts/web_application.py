from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import os
from dotenv import load_dotenv
load_dotenv()

import template.variables as variables

# Set up service object
service = Service(ChromeDriverManager().install())

# Set up the WebDriver (assuming Chrome)
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
options.add_argument('--headless')  # Run in headless mode (without opening a browser window)
driver = webdriver.Chrome(service=service, options=options)

# Function to check website availability
def check_website_availability(service_name, service_url, service_type):
    print(f"<td style='{variables.table_border} {variables.cell_padding} {variables.text_center}'>{service_name}</td>")
    print(f"<td style='{variables.table_border} {variables.cell_padding} {variables.text_center}'><a href='{service_url}'>{service_url}</a></td>")
    print(f"<td style='{variables.table_border} {variables.cell_padding} {variables.text_center}'>{service_type}</td>")
    try:
        driver.get(service_url)
        print(f"<td style='{variables.table_border} {variables.cell_padding} {variables.text_center} {variables.positive_bg} {variables.text_color}'>Available</td>")
        return True
    except:
        print(f"<td style='{variables.table_border} {variables.cell_padding} {variables.text_center} {variables.negative_bg} {variables.text_color}'>Unavailable</td>")
        return False

# Function to check login functionality
def check_login_functionality(username, password):
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME,"email")),
            EC.presence_of_element_located((By.NAME,"password"))
        )

        # Find the username and password input fields and submit button (modify based on your website's structure)
        username_input = driver.find_element(By.NAME,"email")
        password_input = driver.find_element(By.NAME,"password")
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")


        # Enter the login credentials and click the submit button
        username_input.send_keys(username)
        password_input.send_keys(password)
        submit_button.click()

        print(f"<li>Login was successful</li>")
    except:
        print(f"<li>Unable to perform login</li>")

# Function to check logout functionality
def check_logout_functionality():
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//ul[last()]"))
        )

        profile = driver.find_element(By.XPATH, "//ul[last()]")
        driver.get(profile.find_element(By.TAG_NAME, "a").get_attribute('href'))

        print(f"<li>Logout was successful</li>")
    except:
        print(f"<li>Unable to perform logout</li>")


# Call the functions to check website availability and login functionality
if os.getenv('WEB_APPLICATION_URL') and os.getenv('WEB_APPLICATION_USERNAME') and os.getenv('WEB_APPLICATION_PASSWORD'):
    service_name = 'Service Name'
    service_type = 'Service Type'
    website_url = os.getenv('WEB_APPLICATION_URL')
    flag = check_website_availability(website_url)

    if flag:
        username = os.getenv('WEB_APPLICATION_USERNAME')
        password = os.getenv('WEB_APPLICATION_PASSWORD')
        print(f"<td style='{variables.table_border} {variables.cell_padding}'><ul>")
        check_login_functionality(username, password)
        check_logout_functionality()
        print(f"</ul></td>")
    else:
        print(f"<td style='{variables.table_border}'></td>")
else:
    print(f"<td colspan='{variables.colspan}' style='{variables.table_border}'>1Score Dev - Environment variables are not set</td>")

# Close the WebDriver
driver.quit()