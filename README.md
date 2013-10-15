authorizator-example
====================

Example of using node-authorizator with passport-local.

How to run?

```Bash
git clone git@github.com:ivpusic/authorizator-example.git
npm install
# for example of using RoleBasedPolicy authorization
node appRoleBasedPolicy.js
# or if you want run example of using ActionBasedPolicy use
# node appActionBasedPolicy.js
```

Repo contains examples of using node-authorizator module. There are two main .js scripts. 
``appRoleBasedPolicy.js`` which contains example of using RoleBasedPolicy, and ``appActionBasedPolicy.js``
which contains example of using ActionBasedPolicy.

Example provide ability to login to one of two available accounts. One has role admin, and other role user.
There is ``/account`` url to which only admins can access.

Try it!
