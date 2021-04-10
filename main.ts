import express from 'express';
import {upload, GetFilelist, detailDataInfo} from './FileHandler';

const Server = express();

Server.use(express.static("./public"));
Server.use(express.json());
Server.use(express.urlencoded({
	extended: true
}));


Server.get('/IPtest', (req, res) => {
    if (req.socket.remoteAddress) {
        res.send(req.socket.remoteAddress);
    } else {
        res.send("아이피가 없습니다.");
    }
});

Server.post('/upload', upload.any(), express.urlencoded({extended: false}), (req, res) => {
    res.send({status: 0});
})

Server.post('/index', async (req, res) => {
    if (req.socket.remoteAddress && req.body.path) {
        
        let path = req.socket.remoteAddress?.split("").reverse().splice(0, 3).reverse().join("") + req.body.path.replace("..", "");
        path = path.replace("//", "/");

        console.log('indexing', path);

        let result = await GetFilelist(path);

        res.send(result);
    }
})

Server.get('/download', async (req, res) => {
    if (req.socket.remoteAddress && req.body.path) {
        console.log('download req', req.body.path);
        let result = await detailDataInfo(req.body.path);
        if (result.err) {
            res.send(`<script>alert('${result.err.message}')</script>`);
        } else {
            res.download(req.body.path);
        }

    } else {
        res.send("worong data");
    }
})

Server.listen(80, () => {
    console.log("Server on");
})