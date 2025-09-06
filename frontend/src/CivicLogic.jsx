import React from "react";
import { CivicAuthProvider, UserButton, useUser } from "@civic/auth-web3/react";
import { useAutoConnect, embeddedWallet } from "@civic/auth-web3/wagmi";





function CivicLogic() {
  useAutoConnect();
  const user = useUser();

  React.useEffect(() => {
    console.log('Civic User:', user);
  }, [user]);


  return (
    <div>


    </div>
  );
}

export default CivicLogic;
