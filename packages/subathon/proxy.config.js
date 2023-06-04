module.exports = {
    "/auth/oauth/validate": {
        "target": "http://localhost:8080"
    },
    "/auth/code/validate": {
        "target": "http://localhost:8081"
    },
    "/auth/user": {
        "target": "http://localhost:8082"
    },
    "/manage/subathon": {
        "target": "http://localhost:8082",
        router: (request) => {
            if(request.method === 'GET') {
                return 'http://localhost:8086'
            }
            if(request.method === 'POST') {
                return 'http://localhost:8085'
            }
        }
    }
}