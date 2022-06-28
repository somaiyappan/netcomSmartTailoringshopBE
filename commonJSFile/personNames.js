let personNames = (orderlist) => {
    let salwarPersons = [];
    let blousePersons = [];
    let shirtPersons = [];
    let pantPersons = [];
  
    for (let i in orderlist) {
  
      let sd = orderlist[i]["salwarData"];
      for (let j in sd) {
        salwarPersons.push(sd[j]["personName"]);
        salwarPersons = salwarPersons.filter((e, i, a) => a.indexOf(e) === i); //removes duplicate in array
      }
  
      let bd = orderlist[i]["blouseData"];
      for (let j in bd) {
        blousePersons.push(bd[j]["personName"]);
        blousePersons = blousePersons.filter((e, i, a) => a.indexOf(e) === i);
      }
  
      let shd = orderlist[i]["shirtData"];
      for (let j in shd) {
        shirtPersons.push(shd[j]["personName"]);
        shirtPersons = shirtPersons.filter((e, i, a) => a.indexOf(e) === i);
      }
  
      let pd = orderlist[i]["pantData"];
      for (let j in pd) {
        pantPersons.push(pd[j]["personName"]);
        pantPersons = pantPersons.filter((e, i, a) => a.indexOf(e) === i);
      }
  
      salwarPersons = salwarPersons.filter((e) => e !== undefined); //remove undefined in array
      blousePersons = blousePersons.filter((e) => e !== undefined);
      shirtPersons = shirtPersons.filter((e) => e !== undefined);
      pantPersons = pantPersons.filter((e) => e !== undefined);
    }
    let salwarPersonObj = { ["salwarPersons"]: salwarPersons };
    let blousePersonObj = { ["blousePersons"]: blousePersons };
    let shirtPersonObj = { ["shirtPersons"]: shirtPersons };
    let pantPersonObj = { ["pantPersons"]: pantPersons };
  
    return [salwarPersonObj, blousePersonObj, shirtPersonObj, pantPersonObj];
  };

export default personNames