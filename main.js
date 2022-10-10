const { app, BrowserWindow, dialog, ipcMain, clipboard } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let win = null;

app.on("ready", async function () {
    win = new BrowserWindow({
        width: 600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    ipcMain.on("set-title", (event, title) => {
        dialog.showErrorBox(
            "Offline",
            "Bạn chưa kết nối mạng vui lòng kết nối mạng để sử dụng phần mềm"
        );
        win.close();
    });

    ipcMain.on("get-mac", async (event) => {
        event.returnValue = await getMACToOS();
    });

    win.loadFile("index.html");

    win.on("closed", function () {
        win = null;
    });

    let mac = await getMACToOS();

    dialog
        .showMessageBox(win, {
            type: "info",
            title: "Thông báo",
            message: "Đã lấy được MAC của bạn: " + mac,
            buttons: ["Update MAC lên hệ thống", "Copy MAC", "Thoát"],
            cancelId: 2,
        })
        .then(({ response }) => {
            if (response === 0) {
                win.loadURL("https://reg.poly.edu.vn");
            } else if (response === 1) {
                clipboard.writeText(mac);
                dialog.showMessageBox(win, {
                    type: "info",
                    title: "Thông báo",
                    message: "Đã copy MAC",
                    buttons: ["Ok"],
                });
                win.loadURL("https://reg.poly.edu.vn");
            } else {
                win.close();
            }
        });
    // win.webContents.openDevTools();
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

app.on("window-all-closed", function () {
    if (process.platform != "darwin") {
        app.quit();
    }
});

async function getMACToOS() {
    const platform = process.platform;
    if (platform === "win32") {
        return new Promise((resolve, reject) => {
            exec("getmac/v", (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    let mac = null;
                    let list = stdout.split("\n");
                    list.map((value) => {
                        let check = value.search("Wi-Fi");
                        if (check >= 0) {
                            let text = value.split(" ").join(",");
                            textX = text.replace(/,,+/g, ",");
                            let arr = textX.split(",");
                            mac = arr[3];

                            if (mac.length < 3) {
                                mac = arr[4];
                            }
                            resolve(mac);
                        }
                    });
                }
            });
        });
    } else if (platform === "darwin") {
        return new Promise((resolve, reject) => {
            exec(
                "ifconfig en0 | awk '/ether/{print $2}'",
                (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(stdout);
                    }
                }
            );
        });
    } else if (platform === "linux") {
        return new Promise((resolve, reject) => {
            exec("ifconfig | grep ether", (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    } else {
        return "Unknown";
    }
}
