import {mkName} from "./names";

const simpleData = `
    a 
        aa 
            aaa
                aaaa
                aaaaa
                aaaaaa
                aaaaaaa
                aaaaaaaa
                    aaaaaaaaa
                    aaaaaaaab
                    aaaaaaaac
        ab 
            aba 
            abb
                abba`;

const wideData = `
    a
     aa
     ab
     ac
     ad
     ae
     af
     ag
     ah
    b
     ba
     bb
     bc
     bd
     be
     bf
     bg
     bh
    c
     ca
     cb
     cc
     cd
     ce
     cf
     cg
     ch
    d
     da
     db
     dc
     dd
     de
     df
     dg
     dh
    e
     ea
     eb
     ec
     ed
     ee
     ef
     eg
     ah
    f
     fa
     fb
     fc
     fd
     fe
     ff
     fg
     fh
    g
     ga
     gb
     gc
     gd
     ge
     gf
     gg
     gh
    h
     ha
     hb
     hc
     hd
     he
     hf
     hg
     hh
    o
     oa
     ob
     oc
     od
     oe
     of
     og
     oh
    p
     pa
     pb
     pc
     pd
     pe
     pf
     pg
     ph
    
           `;

const complexData = `
    a 
        aa 
        ab 
            aba 
        ac
    b 
        ba 
        bb 
        bc 
            bca 
            bcb 
                bcba 
                bcbb 
                    bcbba 
            bcc 
            bcd
                bcda
                    bcdaa
                    bcdab
                        bcdaba
                        bcdabb
                    bcdac
                bcdb 
                bcdc 
                    bcdca 
                    bcdcb 
                        bcdcba 
                        bcdcbb 
                            bcdcbba 
                            bcdcbbb 
                                bcdcbbba 
                                bcdcbbbb 
                                bcdcbbbc 
                                bcdcbbbd 
                        bcdcbc 
                    bcdcc 
                    bcdcd 
                bcdd 
            bce 
            bcf 
            bcg 
        bd
    c 
        ca 
        cb 
            cba
                cbaa 
                cbab 
                    cbaba 
            cbb 
        cc 
        cd 
            cda 
            cdb 
            cdc 
                cdca 
                cdcb 
                    cdcba 
                        cdcbaa 
                        cdcbab 
                        cdcbac 
                            cdcbaaa 
                                cdcbaaaa 
                                cdcbaaab 
                                cdcbaaac
    d 
        da 
            dab 
            dac 
        db 
            dba 
            dbb 
            dbc 
            dbd 
                dbda 
                    dbdba
                    dbdbb
                    dbdbc
                    dbdbd
                    dbdbe
                        dbdbea
                        dbdbeb
                            dbdbeba
                            dbdbebb
                            dbdbebc
                            dbdbebd
                                dbdbebda
                                    dbdbebdaa
                                    dbdbebdab
                                    dbdbebdac
                                dbdbebdb
                                dbdbebdc
                                    dbdbebdca
                                    dbdbebdcb
                                
                        dbdbec
                            dbdbeca
                            dbdbecb
                        dbdbed
                    dbdbf
                    
                dbdb 
    e 
        ea 
            eab 
            eac 
                eaca 
        eb 
        ec 
            eca
            ecb
            ecc
            ecd
        ed 
            eda
            edb
        ee 
            eea
    f 
        fa 
            faa
            fab
        fb
            fba
            fbb
            fbc
                fbca
                fbcb
    g
    h
    i
    j
    k
    l
    m
    n
    o
    p
    q
    r
        ra
        rb
        rc
            rca
            rcb
            rcc
            rcd
            rce
    s
    t
    u
`;


function getParentId(idMap = {}, d = "") {
    return d.length <= 1
        ? null
        : idMap[d.substr(0, d.length - 1)] || null;
}


function mkData(dataStr) {
    const codes = dataStr.split(/\s+/).filter(code => code !== "");

    let id = 1;
    const idMap = {root: 0};
    codes.forEach(d => idMap[d] = id++);

    return [{id: 0, name: "Root"}]
        .concat(codes
            .map(code => {
                const id = idMap[code];
                const pId = getParentId(idMap, code) || 0;
                return {
                    id,
                    code,
                    parentId: pId,
                    count: Math.floor(Math.random() * 10),
                    name: mkName(Math.ceil(Math.random() * 3))
                };
            }))
        .sort((a,b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
}


export default mkData(simpleData);