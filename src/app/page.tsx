'use client'

import * as React from 'react'
import { redirect } from 'next/navigation'

export interface HomepageProps { }

export default function Homepage({ }: HomepageProps) {
  redirect('/sdfgen/')
}