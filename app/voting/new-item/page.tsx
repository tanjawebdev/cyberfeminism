'use client';
import NewItemForm from '@components/newItemForm/NewItemForm';
import Link from "next/link";
import React from "react";

export default function VotingNewItem() {

    return (
        <main className="voting">
            <div className="voting__header">
                <Link href="/voting" className="back-link">
                    Back
                </Link>
            </div>
            <h1>Add New Item</h1>
            <NewItemForm/>
        </main>
    );
}
