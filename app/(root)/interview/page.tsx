import React from 'react'
import Agent from "@/components/Agent"
import { requireUser } from "@/lib/auth/session"

const page = async () => {

  const user = await requireUser();

  return (
    <>
        <h3>Interview Generation</h3>

        <Agent 
          userName={user.name} 
          userId={user.id} 
          type="generate" 
        />
    </>
  )
}

export default page