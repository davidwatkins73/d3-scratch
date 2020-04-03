const rawData = `
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
            bcc 
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
`;


function getParentId(idMap = {}, d = "") {
    return d.length <= 1
        ? null
        : idMap[d.substr(0, d.length - 1)] || null;
}

function mkData(dataStr) {
    const atoms = dataStr.split(/\s+/).filter(atom => atom !== "");

    let id = 1;
    const idMap = {root: 0};
    atoms.forEach(d => idMap[d] = id++);

    return [{id: 0, name: "Root"}]
        .concat(atoms
            .map(atom => {
                const id = idMap[atom];
                const pId = getParentId(idMap, atom) || 0;
                return {
                    id,
                    parentId: pId,
                    name: atom
                };
            }));
}


export default mkData(rawData);