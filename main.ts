import express from 'express';
import cors from 'cors';
import {upload, GetFilelist, detailDataInfo} from './FileHandler';

const Server = express();

Server.use(express.static("./public"));
Server.use(express.json());
Server.use(express.urlencoded({
	extended: true
}));
Server.use(cors());


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
        
        let path = req.socket.remoteAddress?.split("").reverse().splice(0, 3).reverse().join("");
        if (path == "::1" || "0.1") path = "localhost";
        path += req.body.path.replace("..", "");
        path = path.replace("//", "/");

        console.log('indexing', path);

        let result = await GetFilelist(path);

        if (result.err) res.send({err: result.err});
        else res.send({result: result.result});
    } else {
        res.send({err: "wrong data"});
    }
})

Server.get('/download', async (req, res) => {
    if (req.socket.remoteAddress && req.query.path != undefined) {    
        console.log(req.socket.remoteAddress)
        let name = req.socket.remoteAddress?.split("").reverse().splice(0, 3).reverse().join("");
        if (name == "::1" || "0.1") name = "localhost"

        let path = `${name}/${req.query.path as string}`;

        console.log('download req', req.query.path);
        let result = await detailDataInfo(path);

        if (result.err) {
            console.log(result);
            res.send(result.err.message);
        } else {
            console.log('sending');
            res.download(path);
        }

    } else {
        res.send("wrong data");
    }
})

Server.listen(80, () => {
    console.log("Server on");
})