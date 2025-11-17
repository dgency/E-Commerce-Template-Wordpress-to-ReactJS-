import { useEffect, useMemo, useState } from "react";
import { useWooCommerceShippingZones } from "@/hooks/useWooCommerceShippingZones";
import { useWooCommerceShippingMethods, type ShippingMethod } from "@/hooks/useWooCommerceShippingMethods";

type Props = {
	// Notify parent when a zone is chosen and its default method/cost are resolved
	onChange?: (payload: { zoneId: number | null; method: ShippingMethod | null; cost: number }) => void;
	value?: number | null;
};

const ShippingSelector = ({ onChange, value }: Props) => {
		const { data: zones, isLoading, error } = useWooCommerceShippingZones();
		const [selected, setSelected] = useState<number | null>(value ?? null);
		const { data: methods } = useWooCommerceShippingMethods(selected);

		// Pick a default method for the selected zone: prefer free_shipping, else cheapest
		const defaultMethod = useMemo<ShippingMethod | null>(() => {
			if (!methods || methods.length === 0) return null;
			const free = methods.find((m) => m.method_id === "free_shipping");
			if (free) return free;
			return methods.slice().sort((a, b) => (a.cost || 0) - (b.cost || 0))[0] ?? null;
		}, [methods]);

	useEffect(() => {
		if (value !== undefined) setSelected(value);
	}, [value]);

		const handleSelect = (id: number) => {
			setSelected(id);
		};

		// Emit selection with method and computed cost when available
		useEffect(() => {
			const cost = defaultMethod?.cost ?? 0;
			onChange?.({ zoneId: selected, method: defaultMethod, cost });
		}, [selected, defaultMethod, onChange]);

	return (
		<div className="bg-card rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold font-heading mb-4">Shipping Zone</h2>
			{isLoading && <p className="text-muted-foreground">Loading shipping zones…</p>}
			{error && <p className="text-destructive">Failed to load shipping zones.</p>}
					{!isLoading && !error && (
				<div className="space-y-3">
					{zones && zones.length > 0 ? (
						zones.map((z) => (
							<label key={z.id} className="flex items-center gap-3 cursor-pointer">
								<input
									type="radio"
									name="shippingZone"
									value={z.id}
									checked={selected === z.id}
											onChange={() => handleSelect(z.id)}
									className="h-4 w-4"
								/>
								<span>{z.name}</span>
							</label>
						))
					) : (
						<p className="text-muted-foreground">No shipping zones configured.</p>
					)}
					{/* Hidden field for form submit compatibility */}
							<input type="hidden" name="shippingZoneId" value={selected ?? ''} />
				</div>
			)}
		</div>
	);
};

export default ShippingSelector;
