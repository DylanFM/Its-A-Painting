require 'rubygems'
require 'sinatra'
require 'haml'
require 'data_mapper'

require File.join(File.dirname(__FILE__), "config", "environment.rb")

Dir.glob(File.join(File.dirname(__FILE__), "lib", "*.rb")).each { |f| require f }

DataMapper.setup(:default, DATABASE_OPTIONS)

get '/' do
  @paintings = Painting.all
  haml :index
end

get '/paintings/new' do
  painting = Painting.create(:name => "It's a Masterpiece")
  redirect "/paintings/#{painting.id}"
end

get '/paintings/:id' do
  @painting = Painting.get(params[:id])
  haml :"paintings/show"
end

post '/paintings/:id/actions/new' do

end

get '/paintings/:id/actions' do

end
