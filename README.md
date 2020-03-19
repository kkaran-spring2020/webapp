# CSYE 6225 - Spring 2020

## Information

| Name | NEU ID | Email Address |
| --- | --- | --- |
| Karan | 001449291 | Karan.k@husky.neu.edu |
| | | |


## Technology Stack

* Backend Technology: Node JS
* Framework: Express
* Database: MySQL(RDS)
* S3 bucket- User's attachment is stored in S3 bucket instead of local disk.

## Build Instructions

Pre-req : Need POSTMAN and MySQL installed.

    * Fork repository https://github.com/karank-spring2020/webapp.git 
    
    * Navigate to webapp directory
    
    * Run "npm install" command on terminal to install dependencies
    
    * Run "npm test" command on terminal to test test cases

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
        
    * To Create a Bill 
        - Use v1/bill/ & set Authentication to Basic Auth
        - Success : 201
            {
                "id": "75da0038-1ca2-4c8a-b381-6e8776f928dc",
                "owner_id": "b4afeb77-8c20-4843-aa57-fd9c2da494ee",
                "vendor": "Northeastern University",
                "bill_date": "2020-01-06T00:00:00.000+0000",
                "due_date": "2020-01-12T00:00:00.000+0000",
                "amount_due": 7000.51,
                "creationTime": "2020-01-26T23:48:42.797+0000",
                "updatedTime": "2020-01-26T23:48:42.797+0000",
                "categories": [
                     "college",
                     "spring2020",
                    "tuition"
                ],
                "payment_status": "paid"
                }
        - Not Found : 404 //wrong url
        - UnAuthorized : 401 //unauthorized
             Access Denied
                
    * To retrieve all the bills of specefic user
        - Use v1/bills/ & set Authentication to Basic Auth
        - Success : 200 
            {
                "id": "c969471b-d836-4036-b925-c809a81ecbc9",
                "owner_id": "b4afeb77-8c20-4843-aa57-fd9c2da494ee",
                "vendor": "Northeastern University",
                "bill_date": "2020-01-06T00:00:00.000+0000",
                "due_date": "2020-01-12T00:00:00.000+0000",
                "amount_due": 200.0,
                "creationTime": "2020-01-26T23:48:46.197+0000",
                "updatedTime": "2020-01-26T23:48:46.197+0000",
                "categories": [
                    "college"
                ],
                "payment_status": "paid"
            }
        - No content : 204 //if no bills        
        - Not Found : 404 //wrong url
        - UnAuthorized : 401 //unauthorized
            Access Denied
            
    * To retrieve bill based on id/ to delete bill based on id/ to update bill based on id
        - Use v1/bill/{id] & set Authentication to Basic Auth
        * For retrieve bill i.e. Get request
        -Success : 200
            {
                "id": "e61dfed9-a078-4bb5-aa5e-cc9d1ebe473d",
                "owner_id": "554ded24-27d9-4660-8ef5-912aaf0314ef",
                "vendor": "Northeastern University",
                "bill_date": "2020-01-06T00:00:00.000+0000",
                "due_date": "2020-01-12T00:00:00.000+0000",
                "amount_due": 7000.51,
                "creationTime": "2020-01-26T20:18:12.000+0000",
                "updatedTime": "2020-01-26T20:18:12.000+0000",
                "categories": [
                    "college",
                    "spring2020",
                    "tuition"
                ],
                "payment_status": "paid"
            }
        - No content : 204 //if no bills        
        - Not Found : 404 //wrong url
        - UnAuthorized : 401 //unauthorized
            Access Denied
                 
        * For delete bill i.e. Delete Request
        - Success : 200
        - No content : 204 //if no bills        
        - Not Found : 404 //wrong url
        - UnAuthorized : 401 //unauthorized
            Access Denied
        
        * For update bill i.e. PUT request
        - Success : 200
        - No content : 204 //if no bills        
        - Not Found : 404 //wrong url
        - UnAuthorized : 401 //unauthorized
            Access Denied
        
    * To attach a file to bill:
        -Use : localhost:8080/v1/bill/{billId}/file
        -Success : 201
            {
                "id": "aab496d7-f065-4dc9-9e0a-1e95ef3ff8cb",
                "fileName": "imgb6dbaccba9e.jpg"",
                "url": "/Users/nupur/cloudGit/webapp/imgb6dbaccba9e.jpg",
                "uploadeDate": "2020-02-10T21:31:07.335+0000"
            }
        - 404 : NotFound/UnAuthorized
        
    * To get a file information of bill:
        -Use : localhost:8080/v1/bill/{billId}/file/{fileId}
        -Success : 200
            {
                "id": "aab496d7-f065-4dc9-9e0a-1e95ef3ff8cb",
                "fileName": "imgb6dbaccba9edbaccba9e.jpg",
                "url": "/Users/nupur/cloudGit/webapp/imgb6dbaccba9edbaccba9e.jpg",
                "uploadeDate": "2020-02-10T21:31:07.335+0000"
            }
        - 404 : NotFound/UnAuthorized
    
    * To delete a file attached to bill:
        -Use : localhost:8080/v1/bill/{billId}/file/{fileId}
        -No Content : 204     
            
## Running Tests

    * Used Mocha chai for unit testing for creation of user.
    * Run Application using "Run All Tests"

## CI/CD
   * Used CircleCI for continous integration and testing
