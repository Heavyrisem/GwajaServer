import multer from 'multer';
import fs from 'fs';

const Root = "File/";

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (req.socket.remoteAddress) {
                let path = `${Root}/${GetNameByIp(req.socket.remoteAddress)}`;
                
                if (!fs.existsSync(path)) {
                    console.log(`${path} is not found Creating New Dir`);
                    fs.mkdir(path, {recursive: true}, err => {
                        if (err) return console.log("eror while creating Dir",err);
                        cb(null, path);
                    });
                } else {
                    cb(null, path);
                }
            }
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
})


const GetFilelist = (path: string): Promise<{result?: Array<DataInfo>, err?: NodeJS.ErrnoException}> => {
    return new Promise(resolve => {

        let result: Array<DataInfo> = [];
        path = Root + path;
        fs.readdir(path, {withFileTypes: true}, (err, files) => {

            if (err) return resolve({err});
            if (files.length == 0) return resolve({result});

            files.forEach(async file => {
                let info = await detailDataInfo(`${path}/${file.name}`);
                if (info.err) return resolve({err: info.err});

                if (info.result) {
                    info.result.path = info.result?.path.split(path)[info.result?.path.split(path).length - 1];
                    result.push(info.result);
                    if (result.length == files.length) return resolve({result});
                }
            })

        })

    })
}


const detailDataInfo = (path: string): Promise<{result?: DataInfo, err?: NodeJS.ErrnoException}> => {
    return new Promise(resolve => {
        fs.stat(path, (err, stats) => {
            if (err) return resolve({err});

            let name = path.split('/');
            let info: DataInfo = {
                name: name[name.length-1],
                path,
                isFile: stats.isFile(),
                size: stats.size,
                c_time: stats.birthtime,
                m_time: stats.mtime
            }

            return resolve({result: info});
        })
    })
}


function GetNameByIp(ip: string): string {
    let result = ip.split(".").reverse()[0];
    if (result == "::1" || result == "1") return "localhost";
    console.log(ip, result)
    return result;
}


interface DataInfo {
    name: string,
    path: string,
    isFile: boolean,
    size: number,
    c_time: Date,
    m_time: Date
}


export {upload, GetNameByIp, GetFilelist, detailDataInfo}