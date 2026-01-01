import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import type { RoomType, RoomStatus } from '@/types/hotel';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const amenitiesList = ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Safe', 'Coffee Maker'];

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const [formData, setFormData] = useState({
    number: '',
    floor: '',
    type: 'single' as RoomType,
    status: 'available' as RoomStatus,
    pricePerNight: '',
    maxOccupancy: '',
    amenities: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.floor || !formData.pricePerNight) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    toast({ title: "Room Added", description: `Room ${formData.number} has been created successfully` });
    onOpenChange(false);
    setFormData({
      number: '',
      floor: '',
      type: 'single',
      status: 'available',
      pricePerNight: '',
      maxOccupancy: '',
      amenities: [],
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room in the hotel inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number *</Label>
              <Input
                id="number"
                placeholder="e.g., 101"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                placeholder="e.g., 1"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={formData.type} onValueChange={(value: RoomType) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: RoomStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price Per Night ($) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 150"
                value={formData.pricePerNight}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupancy">Max Occupancy</Label>
              <Input
                id="occupancy"
                type="number"
                placeholder="e.g., 2"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-4 gap-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
