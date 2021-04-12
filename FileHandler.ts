import multer from 'multer';
import fs from 'fs';

const Root = "/File/";

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (req.socket.remoteAddress){    
                let name = req.socket.remoteAddress?.split("").reverse().splice(0, 3).reverse().join("");
                if (name == "::1" || "0.1") name = "localhost"
                console.log(name);

                if (!fs.existsSync(name)) {
                    console.log(name + " is not found Creating New Directory");
                    fs.mkdir(name, {recursive: true}, (err) => {
                        if (err) return console.log(err);
                        cb(null, name);
                    });
                } else {
                    cb(null, name);
                }
            }    
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
});


const GetFilelist = (path: string): Promise<{result?: Array<DataInfo>, err?: NodeJS.ErrnoException}> => {
    return new Promise(resolve => {
        

        let dirlist: Array<DataInfo> = [];
        path = Root+path;
        fs.readdir(path, {withFileTypes:true}, (err, files) => {
            
            if (err) return resolve({err: err});
            if (files.length == 0) return resolve({result: dirlist});
            files.forEach(async file => {
                // console.log(path);
                let info = await detailDataInfo(path+'/'+file.name);
                if (info.err) return resolve({err: info.err});
                
                console.log(info.result?.path.split(path));
                if (info.result) {
                    info.result.path = info.result?.path.split(path)[info.result?.path.split(path).length - 1];
                }

                dirlist.push(info.result as DataInfo);
                if (dirlist.length == files.length) return resolve({result: dirlist});
            });
        });

    })
}

interface DataInfo {
    name: string,
    path: string,
    isFile: boolean,
    size: number,
    c_time: Date,
    m_time: Date
}

const detailDataInfo = (path: string): Promise<{result?: DataInfo, err?: NodeJS.ErrnoException}> => {
    return new Promise(resolve => {
        fs.stat(path, (err, stats) => {
            if (err) return resolve({err: err});
            
            let name = path.split('/');
    
            let info: DataInfo = {
                name: name[name.length-1],
                path: path,
                isFile: stats.isFile(),
                size: stats.size,
                c_time: stats.birthtime,
                m_time: stats.mtime
            }
    
            return resolve({result: info});
        });
    })
}

export {upload, GetFilelist, detailDataInfo}