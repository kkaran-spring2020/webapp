# CSYE 6225 - Spring 2020

## Information

| Name | NEU ID | Email Address |
| --- | --- | --- |
| Karan | 001449291 | Karan.k@husky.neu.edu |
| | | |

## Technology Stack

* Backend Technology: Node JS
* Framework: Express
* Database: MySQL

## Build Instructions

Pre-req : Need POSTMAN and MariaDB installed.
    * Clone repository https://github.com/karank-spring2020/webapp.git 
    * Navigate to webapp directory
    * Run "npm install" command on terminal

## Deploy Instructions
    * Open POSTMAN
    * To Create User -
        - Use v1/user & No Authentication
        - Success : 200 OK
            {         
                “id": "88cba988-3415-45d9-b459-8de0c65e3637”,
                "first_name": “Karan”,
                "last_name": “Aggarwal”,
                "email_address”: “Karan.aggarwal@gmail.com",
                “account_created”: "2020-01-30T01:01:08.130+0080",
                “account_updated”: "2020-01-30T01:02:70.160+0700"
             }
         - Failure : 400 BAD REQUEST
    
    * To Get User -
        - Use v1/user/self & set Authentication to Basic Auth
        - Success : 200 OK
            {
             “id": "88cba988-3415-45d9-b459-8de0c65e3637”,
                "first_name": “Karan”,
                "last_name": “Aggarwal”,
                "email_address”: “Karan.aggarwal@gmail.com",
                “account_created”: "2020-01-30T01:01:08.130+0080",
                “account_updated”: "2020-01-30T01:02:70.160+0700"
            }
        - Failure : 401 UNAUTHORIZED     
            Access Denied
            
    * To Update User
        - Use v1/user/self & set Authentication to Basic Auth
        - Success : 204 NO CONTENT
        - Failure : 400 BAD REQUEST
            
## Running Tests

    * Used Mocha chai for unit testing for creation of user.
    * Run Application using "Run All Tests"

## CI/CD
   * Used CircleCI for continous integration and testing
