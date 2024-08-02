'use client';
import NewItemForm from '@components/newItemForm/NewItemForm';
import Link from "next/link";
import React from "react";

export default function VotingNewItem() {

    return (
        <main className="voting">
            <NewItemForm/>
        </main>
    );
}
