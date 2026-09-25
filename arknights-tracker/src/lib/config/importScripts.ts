export const powerShellScript = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ivaqis/arknights-pull-url/refs/heads/main/endfield-url.ps1'))}"`;

export const powerShellScript2 = `$f=[System.IO.File]::Open("$env:LOCALAPPDATA\\PlatformProcess\\Cache\\data_1",3,1,3); $t=(New-Object System.IO.StreamReader($f,[System.Text.Encoding]::ASCII)).ReadToEnd(); $f.Close(); $m=[regex]::Matches($t,"u8_token=([^&\\s\\x00]+)"); if($m.Count){ $m[$m.Count-1].Groups[1].Value | Set-Clipboard }`;

export const powerShellScript3 = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ivaqis/arknights-pull-url/refs/heads/main/endfield-url2.ps1'))}"`;

export const browserBookmarklet = `javascript:(async()=>{try{let e=null;for(let[t,n]of Object.entries(sessionStorage))if(t.startsWith("APP_ROLE_U8_TOKEN:")){e=n.toString().split(":")[0];break}if(!e)throw new Error("Token not found. Please log in and refresh the page.");await navigator.clipboard.writeText(e),alert("Success! Token copied to clipboard.")}catch(e){alert("Error: "+e.message)}})();`;

export const toolsdevBookmarklet = `javascript:(async()=>{try{let e=localStorage.getItem("headhunt_user_data_v2");if(!e)throw new Error("Data not found.");await navigator.clipboard.writeText(e),alert("Success! Data copied to clipboard.")}catch(e){alert("Error: "+e.message)}})();`;
